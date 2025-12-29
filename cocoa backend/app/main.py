from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import overview, batches, documents, rules

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# CORS (required when connecting AI Studio or frontend later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(overview.router, prefix="/overview", tags=["Overview"])
app.include_router(batches.router, prefix="/batches", tags=["Batches"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(rules.router, prefix="/rules", tags=["Rules"])


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "status": "running"
    }
