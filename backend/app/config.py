"""Centralized configuration for the Nest backend.

All environment variables are loaded once here so the rest of the app does
not call ``os.getenv`` ad hoc. Values are exposed through a cached
``Settings`` instance via :func:`get_settings`.

Design notes
------------
* ``load_dotenv`` checks both ``backend/.env`` and the repo-root ``.env``.
  ``backend/.env`` takes precedence when both are present.
* Secrets (``GROQ_API_KEY``) are validated lazily. Importing this module
  -- or hitting ``/health`` -- never crashes if the key is missing. The
  error only surfaces when something actually needs the key, and the
  message tells the operator exactly where to set it.
* Path-shaped values (``CHROMA_DIR``, ``RESOURCE_DB_PATH``) are resolved
  relative to the ``backend/`` directory so the same value works whether
  the service is started from the repo root or from ``backend/``.
"""

from __future__ import annotations

import logging
import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


logger = logging.getLogger("uvicorn.error")

BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

# Known-good origins used when CORS_ORIGINS is unset in production. If you
# stand up a new frontend host, add it here rather than falling back to "*".
PRODUCTION_ALLOWLIST: list[str] = [
    "https://nest-zeta-nine.vercel.app",
]

# Load both dotenv locations:
# 1) backend/.env (preferred for backend-only deployment)
# 2) repo-root .env (fallback for local monorepo setups)
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")


class ConfigError(RuntimeError):
    """Raised when a required environment variable is missing or invalid."""


class Settings:
    """Typed view over the process environment."""

    def __init__(self) -> None:
        self.environment: str = os.getenv("ENVIRONMENT", "development")
        self.model_name: str = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
        self.cors_origins: list[str] = self._parse_cors(
            os.getenv("CORS_ORIGINS", "*"), self.environment
        )
        self.chroma_dir: Path = self._resolve_path(os.getenv("CHROMA_DIR", "vectorstore"))
        self.resource_db_path: Path = self._resolve_path(
            os.getenv("RESOURCE_DB_PATH", "data/georgia_resources.json")
        )
        self.collection_name: str = os.getenv("CHROMA_COLLECTION", "nest_resources")
        self.embedding_model: str = os.getenv(
            "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
        )

        self._groq_api_key: str | None = (os.getenv("GROQ_API_KEY") or "").strip() or None

    @property
    def groq_api_key(self) -> str:
        """Return the Groq API key or raise a clear ConfigError if missing."""
        if not self._groq_api_key:
            raise ConfigError(
                "GROQ_API_KEY is not set. Add it to backend/.env or the repo "
                "root .env for local development, or define it under "
                "Environment in the Render service dashboard before calling "
                "/chat."
            )
        return self._groq_api_key

    @property
    def has_groq_api_key(self) -> bool:
        return self._groq_api_key is not None

    @staticmethod
    def _parse_cors(raw: str, environment: str) -> list[str]:
        cleaned = raw.strip()
        if cleaned in {"", "*"}:
            if environment == "production":
                logger.error(
                    "CORS_ORIGINS is unset or '*' in production; falling back "
                    "to PRODUCTION_ALLOWLIST (%s). Set CORS_ORIGINS explicitly "
                    "in the Render environment to override.",
                    PRODUCTION_ALLOWLIST,
                )
                return list(PRODUCTION_ALLOWLIST)
            return ["*"]
        return [origin.strip() for origin in cleaned.split(",") if origin.strip()]

    @staticmethod
    def _resolve_path(value: str) -> Path:
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = BACKEND_DIR / path
        return path


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a process-wide cached :class:`Settings` instance."""
    return Settings()
