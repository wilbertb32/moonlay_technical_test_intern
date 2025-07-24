from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import psycopg2.extras


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.route("/tasks", methods=["POST", "OPTIONS"])
def create_task():
    if request.method == "OPTIONS":
        return '', 204
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO tasks (user_id, assignee_id, title, description, status, created_at, updated_at, deadline)
        VALUES (%s, %s, %s, %s, %s, CURRENT_DATE, CURRENT_DATE, %s)
        RETURNING task_id
    """, (
        data.get("user_id"),
        data.get("assignee_id"),
        data.get("title"),
        data.get("description"),
        data.get("status"),
        data.get("deadline"),
    ))
    task_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"task_id": task_id}), 201

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


# Edit/Update a task
@app.route("/tasks/<int:task_id>", methods=["PUT", "OPTIONS"])
def update_task(task_id):
    if request.method == "OPTIONS":
        return '', 204
    if request.method != "PUT":
        return jsonify({"error": "Invalid method"}), 405
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE tasks
        SET assignee_id = %s, title = %s, description = %s, status = %s, updated_at = CURRENT_DATE, deadline = %s
        WHERE task_id = %s
        RETURNING task_id
    """, (
        data.get("assignee_id") or data.get("assigneeId"),
        data.get("title"),
        data.get("description"),
        data.get("status"),
        data.get("deadline"),
        task_id
    ))
    updated = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if updated:
        return jsonify({"task_id": updated[0]}), 200
    else:
        return jsonify({"error": "Task not found"}), 404

# Delete a task
@app.route("/tasks/<task_id>", methods=["DELETE", "OPTIONS"])
def delete_task(task_id):
    if request.method == "OPTIONS":
        return '', 204
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE task_id = %s RETURNING task_id", (int(task_id),))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if deleted:
        return jsonify({"task_id": deleted[0]}), 200
    else:
        return jsonify({"error": "Task not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)