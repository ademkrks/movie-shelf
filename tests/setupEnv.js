// Test ortamını belirler
process.env.NODE_ENV = "test";

// Testlerde gerçek secret ve servis bilgileri kullanılmaz
process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/movieshelf_test";

process.env.JWT_SECRET =
    "test-jwt-secret-only-for-automated-tests";

process.env.JWT_EXPIRES_IN =
    "1h";

process.env.TMDB_API_KEY =
    "test-tmdb-api-key";

process.env.TMDB_BASE_URL =
    "https://api.themoviedb.org/3";

process.env.CORS_ORIGIN =
    "http://localhost:3000";

process.env.FRONTEND_URL =
    "http://localhost:3000";

process.env.EMAIL_HOST =
    "smtp.example.com";

process.env.EMAIL_PORT =
    "587";

process.env.EMAIL_SECURE =
    "false";

process.env.EMAIL_USER =
    "test@example.com";

process.env.EMAIL_PASS =
    "test-password";

process.env.EMAIL_FROM =
    "MovieShelf <test@example.com>";