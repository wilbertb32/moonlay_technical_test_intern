from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import uuid

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'super-secret-key'
jwt = JWTManager(app)

# Dummy user data
users = [
    {"id": "1", "username": "alice"},
    {"id": "2", "username": "bob"}
]

# Dummy task data
tasks = []

@app.route('/api/hello')
def hello():
    return jsonify({'message': 'Fetch Flask test'})

# Auth endpoint
@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    user = next((u for u in users if u['username'] == username), None)
    if not user:
        return jsonify({"msg": "Bad username"}), 401
    access_token = create_access_token(identity=user['id'])
    return jsonify(access_token=access_token)

# Get all users (assignee list)
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    return jsonify(users)

# CRUD Task endpoints
@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    data = request.json
    task = {
        "id": str(uuid.uuid4()),
        "title": data.get("title"),
        "description": data.get("description"),
        "assignee_id": data.get("assignee_id")
    }
    tasks.append(task)
    return jsonify(task), 201

@app.route('/api/tasks/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    return jsonify(task)

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    data = request.json
    task.update({
        "title": data.get("title", task["title"]),
        "description": data.get("description", task["description"]),
        "assignee_id": data.get("assignee_id", task["assignee_id"])
    })
    return jsonify(task)

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    global tasks
    tasks = [t for t in tasks if t['id'] != task_id]
    return jsonify({"msg": "Task deleted"})

if __name__ == '__main__':
    app.run(debug=True)