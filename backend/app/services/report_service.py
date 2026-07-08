import os
import uuid
import json
import logging
import markdown
from xhtml2pdf import pisa
from typing import Dict, Any
from langchain_core.messages import SystemMessage
from app.services import analytics_service, rag_service, chat_service
from app.db.models import Document
from app.core.exceptions import AppException

logger = logging.getLogger(__name__)

REPORT_DIR = "uploads/reports"
os.makedirs(REPORT_DIR, exist_ok=True)

def _convert_html_to_pdf(html_content: str, output_path: str) -> bool:
    with open(output_path, "w+b") as result_file:
        pisa_status = pisa.CreatePDF(html_content, dest=result_file)
        return not pisa_status.err

def generate_business_report(document: Document) -> Dict[str, str]:
    """
    Generates a full markdown report using Pandas analytics and Gemini.
    Compiles the Markdown to HTML, and then to a PDF file.
    """
    try:
        # 1. Run Analytics
        stats = analytics_service.analyze_dataset(document.file_path, document.file_type)
        
        # 2. RAG Search for context 
        rag_context = rag_service.search_context(query=f"business insights context for {document.filename}", limit=3)
        context_str = "\\n".join([f"- {c['metadata'].get('filename')}: {c['content'][:200]}..." for c in rag_context])
        
        # 3. LLM Synthesis
        llm = chat_service.get_llm()
        
        prompt = f"""You are a Chief Data Officer. Write a comprehensive Business Report for the dataset: '{document.filename}'.
        
Structure the report EXACTLY with these sections (use Markdown):
# Executive Summary
# Data Quality & Statistics
# Business Recommendations
# References

Use the following data:
Total Rows: {stats.get('total_rows')}
Total Columns: {stats.get('total_columns')}
Summary Stats: {json.dumps(stats.get('summary_statistics'))[:1000]}
Trend Data Detected: {'Yes' if stats.get('trend') else 'No'}

Use the following retrieved context for References/Background:
{context_str}

Ensure the tone is professional, analytical, and actionable. Do not include raw JSON in the report."""

        response = llm.invoke([SystemMessage(content=prompt)])
        markdown_report = response.content
        
        # 4. Save Markdown
        report_id = str(uuid.uuid4())
        md_path = os.path.join(REPORT_DIR, f"{report_id}.md")
        pdf_path = os.path.join(REPORT_DIR, f"{report_id}.pdf")
        
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(markdown_report)
            
        # 5. Convert to PDF
        # Add basic CSS for professional PDF rendering
        html_content = f"""
        <html>
        <head>
        <style>
            @page {{ size: a4 portrait; margin: 2cm; }}
            body {{ font-family: Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }}
            h1 {{ color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 0; }}
            h2 {{ color: #2563eb; margin-top: 25px; }}
            table {{ border-collapse: collapse; width: 100%; margin: 15px 0; }}
            th, td {{ border: 1px solid #e5e7eb; padding: 10px; text-align: left; }}
            th {{ background-color: #f3f4f6; font-weight: bold; }}
            ul {{ margin-bottom: 15px; }}
            li {{ margin-bottom: 5px; }}
        </style>
        </head>
        <body>
        {markdown.markdown(markdown_report, extensions=['tables'])}
        </body>
        </html>
        """
        
        success = _convert_html_to_pdf(html_content, pdf_path)
        if not success:
            logger.warning("PDF conversion completed with minor warnings (often CSS compatibility).")

        return {
            "report_id": report_id,
            "markdown_content": markdown_report,
            "md_url": f"/api/v1/reports/download/{report_id}?format=md",
            "pdf_url": f"/api/v1/reports/download/{report_id}?format=pdf"
        }

    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise AppException(message=f"Failed to generate report: {str(e)}", status_code=500)
