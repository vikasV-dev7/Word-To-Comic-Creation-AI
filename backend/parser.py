import fitz  # PyMuPDF
import docx
import io

def parse_pdf(file_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text() + "\n"
    return text

def parse_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return "\n".join(text)

def parse_txt(file_bytes: bytes) -> str:
    return file_bytes.decode('utf-8', errors='replace')

def parse_document(file_bytes: bytes, filename: str) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext == "pdf":
        return parse_pdf(file_bytes)
    elif ext == "docx":
        return parse_docx(file_bytes)
    elif ext == "txt":
        return parse_txt(file_bytes)
    else:
        # Fallback to generic decoding
        return parse_txt(file_bytes)
