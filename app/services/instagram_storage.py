import json
import os
from typing import Optional, Dict

STORAGE_FILE = "instagram_connections.json"


def load_connections() -> Dict:
    """Load Instagram connections from file"""
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}


def save_connections(connections: Dict):
    """Save Instagram connections to file"""
    with open(STORAGE_FILE, "w") as f:
        json.dump(connections, f, indent=2)


def get_user_connection(user_id: str) -> Optional[Dict]:
    """Get Instagram connection for a user"""
    connections = load_connections()
    return connections.get(user_id)


def save_user_connection(user_id: str, connection_data: Dict):
    """Save Instagram connection for a user"""
    connections = load_connections()
    connections[user_id] = connection_data
    save_connections(connections)


def delete_user_connection(user_id: str):
    """Delete Instagram connection for a user"""
    connections = load_connections()
    if user_id in connections:
        del connections[user_id]
        save_connections(connections)


def save_instagram_post(user_id: str, post_data: Dict):
    """Save Instagram post data"""
    posts_file = f"instagram_posts_{user_id}.json"
    posts = []
    if os.path.exists(posts_file):
        try:
            with open(posts_file, "r") as f:
                posts = json.load(f)
        except:
            posts = []
    
    posts.append(post_data)
    
    with open(posts_file, "w") as f:
        json.dump(posts, f, indent=2)

