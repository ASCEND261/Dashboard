import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata

from app.routers import (
    auth,
    achievements,
    proofs,
    core,
    leaderboard,
    rules,
    audit,
    integration,
    ai,
    email_service
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ascend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
    # Ensure storage directory exists
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    yield

app = FastAPI(
    title="ASCEND API",
    description="ASCEND — Team Achievement & Verification Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev and demo portability
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global custom exception handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Our engineering team has been notified."}
    )

# Mount Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(achievements.router, prefix=api_v1)
app.include_router(proofs.router, prefix=api_v1)
app.include_router(core.router, prefix=api_v1)
app.include_router(leaderboard.router, prefix=api_v1)
app.include_router(rules.router, prefix=api_v1)
app.include_router(audit.router, prefix=api_v1)
app.include_router(integration.router, prefix=api_v1)
app.include_router(ai.router, prefix=api_v1)
app.include_router(email_service.router, prefix=api_v1)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ASCEND API",
        "version": settings.VERSION,
        "platform": "Team Achievement & Verification Platform"
    }

@app.get("/")
def root():
    return {
        "message": "ASCEND API is operational. Visit /docs for interactive Swagger API documentation.",
        "documentation": "/docs"
    }
