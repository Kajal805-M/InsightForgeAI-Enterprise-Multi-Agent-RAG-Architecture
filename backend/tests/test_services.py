import hashlib

def test_hash_generation():
    """Unit test simulating duplicate detection hashing logic."""
    content1 = b"Enterprise Data"
    content2 = b"Enterprise Data"
    content3 = b"Different Data"
    
    hash1 = hashlib.sha256(content1).hexdigest()
    hash2 = hashlib.sha256(content2).hexdigest()
    hash3 = hashlib.sha256(content3).hexdigest()
    
    assert hash1 == hash2
    assert hash1 != hash3
