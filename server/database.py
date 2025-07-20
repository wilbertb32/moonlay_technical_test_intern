from flask import Flask, jsonify
import psycopg2
import psycopg2.extras

app = Flask(__name__)

# Database config
DB_HOST = "localhost"
DB_NAME = "task_management"
DB_USER = "postgres"
DB_PASS = "wilbertyang"

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn

@app.route("/database")
def index():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    s = "SELECT * FROM tasks"
    cur.execute(s)
    tasks = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(task) for task in tasks])

if __name__ == "__main__":
    app.run(debug=True)