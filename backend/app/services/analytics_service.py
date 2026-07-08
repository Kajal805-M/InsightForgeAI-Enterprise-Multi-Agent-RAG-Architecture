import pandas as pd
import json
import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage
from app.services import chat_service
from app.core.exceptions import AppException

logger = logging.getLogger(__name__)

def generate_business_insights(summary_stats: str, correlation: str) -> str:
    """Uses Gemini to generate natural language business insights from Pandas stats."""
    llm = chat_service.get_llm()
    prompt = f"""You are a senior Business Intelligence Analyst.
Analyze the following dataset summary statistics and correlations.
Provide 3-5 bullet points of clear, actionable business insights. Use markdown.

Summary Statistics:
{summary_stats}

Correlations:
{correlation}
"""
    try:
        response = llm.invoke([SystemMessage(content=prompt)])
        return response.content
    except Exception as e:
        logger.error(f"Failed to generate insights: {str(e)}")
        return "Failed to generate business insights due to AI service error."

def analyze_dataset(file_path: str, file_type: str) -> Dict[str, Any]:
    """
    Loads a dataset using Pandas, computes metrics, and generates AI insights.
    """
    try:
        if file_type.upper() == "CSV":
            df = pd.read_csv(file_path)
        elif file_type.upper() == "XLSX":
            df = pd.read_excel(file_path)
        else:
            raise AppException(message=f"Unsupported file type for analytics: {file_type}", status_code=400)

        # Basic Stats
        total_rows = len(df)
        total_cols = len(df.columns)
        
        # Convert int64/float64/NaNs securely for JSON serialization
        # df.isnull().sum() creates a Series, to_dict maps it. Replace NaNs if necessary, but counts are ints
        missing_values = df.isnull().sum().to_dict()
        missing_values = {k: int(v) for k, v in missing_values.items()}
        
        numeric_df = df.select_dtypes(include='number')
        
        # Summary statistics
        summary = {}
        if not numeric_df.empty:
            summary_df = numeric_df.describe().replace({pd.NA: None})
            summary = json.loads(summary_df.to_json())
            
        # Correlation
        correlation = {}
        if len(numeric_df.columns) > 1:
            corr_df = numeric_df.corr().replace({pd.NA: None})
            correlation = json.loads(corr_df.to_json())

        # Trend Analysis (Look for a datetime column)
        trend_data = {}
        datetime_cols = df.select_dtypes(include=['datetime64', 'object']).columns
        time_col = None
        
        for col in datetime_cols:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    df[col] = pd.to_datetime(df[col])
                    time_col = col
                    break
                except Exception:
                    pass
        
        if time_col and not numeric_df.empty:
            first_num_col = numeric_df.columns[0]
            trend_df = df.groupby(df[time_col].dt.date)[first_num_col].mean().reset_index()
            trend_data = {
                "labels": trend_df[time_col].astype(str).tolist(),
                "values": trend_df[first_num_col].astype(float).tolist(),
                "metric_name": first_num_col
            }

        # AI Insights
        # Convert dictionaries to JSON strings to save tokens
        summary_str = json.dumps(summary, default=str)[:2000] 
        corr_str = json.dumps(correlation, default=str)[:1000]
        insights = generate_business_insights(summary_str, corr_str)

        return {
            "total_rows": total_rows,
            "total_columns": total_cols,
            "missing_values": missing_values,
            "summary_statistics": summary,
            "correlation": correlation,
            "trend": trend_data,
            "insights": insights
        }

    except Exception as e:
        logger.error(f"Analytics failed: {str(e)}")
        raise AppException(message=f"Failed to analyze dataset: {str(e)}", status_code=500)
