import os
import socket
import ssl
from urllib.parse import urlparse

logger = __import__("logging").getLogger("corefusion")


def diagnose_redis_connection():
    """Temporary Redis connectivity diagnostics for Render/Upstash.

    This intentionally logs only the scheme/host/port status and whether DNS,
    TCP, or TLS negotiation succeeds. It never logs credentials or the full URL.
    """
    url = os.getenv("REDIS_URL", "") or os.getenv("REDIS_URL_OVERRIDE", "")

    if not url:
        logger.error("REDIS DIAG: REDIS_URL is missing")
        return

    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port or 6379

    logger.info(
        "REDIS DIAG: configured=True tls=%s port=%s",
        parsed.scheme == "rediss",
        port,
    )

    if not host:
        logger.error("REDIS DIAG: hostname missing from Redis URL")
        return

    try:
        addresses = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
        logger.info("REDIS DIAG: DNS OK - %s address(es)", len(addresses))
    except Exception as exc:
        logger.error("REDIS DIAG: DNS FAILED - %s: %s", type(exc).__name__, str(exc))
        return

    try:
        with socket.create_connection((host, port), timeout=10):
            logger.info("REDIS DIAG: TCP CONNECTION OK")
    except Exception as exc:
        logger.error("REDIS DIAG: TCP FAILED - %s: %s", type(exc).__name__, str(exc))
        return

    try:
        context = ssl.create_default_context()
        with socket.create_connection((host, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=host) as tls_sock:
                logger.info("REDIS DIAG: TLS CONNECTION OK - %s", tls_sock.version())
    except Exception as exc:
        logger.error("REDIS DIAG: TLS FAILED - %s: %s", type(exc).__name__, str(exc))
