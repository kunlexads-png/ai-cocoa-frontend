from pydantic_settings import BaseSettings



class Settings(BaseSettings):
    APP_NAME: str = "AI Cocoa Export Control Tower"
    ENVIRONMENT: str = "development"

    # API behavior
    DEBUG: bool = True

    # CORS (safe default for AI Studio testing)
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1"
    ]


settings = Settings()
