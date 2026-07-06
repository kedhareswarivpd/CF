import psycopg2



try:
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Database connected successfully!")

    cur = conn.cursor()

    # Test query
    cur.execute("SELECT version();")
    version = cur.fetchone()

    print("\nPostgreSQL Version:")
    print(version[0])

    cur.close()
    conn.close()

    print("\n✅ Connection closed.")

except Exception as e:
    print("❌ Connection failed!")
    print("Error:", e)