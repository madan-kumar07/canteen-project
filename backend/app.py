from gevent import monkey
monkey.patch_all()

import json
import os
import time
import random
import hmac
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import razorpay

app = Flask(__name__)
app.config['SECRET_KEY'] = 'smartcanteen-secret-2024'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

# Razorpay test credentials (replace with real ones for production)
RZP_KEY_ID     = 'rzp_test_YourKeyHere'
RZP_KEY_SECRET = 'YourSecretHere'
rzp_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))

DB_FILE = "db.json"

def load_db():
    if not os.path.exists(DB_FILE):
        return {
            "users": {},
            "menu": [
                # Morning Snacks
                {"id": "1", "name": "Vadai", "price": 5, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80", "available": True},
                {"id": "2", "name": "Bonda", "price": 5, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "3", "name": "Egg Puffs", "price": 10, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80", "available": True},
                {"id": "4", "name": "Veg Puffs", "price": 10, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80", "available": True},
                {"id": "5", "name": "Jam Bun", "price": 10, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80", "available": True},
                {"id": "6", "name": "Butter Bun", "price": 10, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&q=80", "available": True},
                {"id": "7", "name": "Tea", "price": 10, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80", "available": True},
                {"id": "8", "name": "Coffee", "price": 12, "category": "Morning Snacks", "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80", "available": True},

                # Lunch
                {"id": "9", "name": "Chapati", "price": 10, "category": "Lunch", "image": "https://images.unsplash.com/photo-1565557612627-fa85cf2153fa?w=500&q=80", "available": True},
                {"id": "10", "name": "Parotta", "price": 10, "category": "Lunch", "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80", "available": True},
                {"id": "11", "name": "Curd Rice", "price": 20, "category": "Lunch", "image": "https://images.unsplash.com/photo-1626374965325-10eb0c50d40e?w=500&q=80", "available": True},
                {"id": "12", "name": "Sambar Rice", "price": 30, "category": "Lunch", "image": "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80", "available": True},
                {"id": "13", "name": "Veg Fried Rice", "price": 60, "category": "Lunch", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80", "available": True},
                {"id": "14", "name": "Chicken Fried Rice", "price": 80, "category": "Lunch", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80", "available": True},
                {"id": "15", "name": "Veg Noodles", "price": 60, "category": "Lunch", "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80", "available": True},
                {"id": "16", "name": "Chicken Noodles", "price": 80, "category": "Lunch", "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80", "available": True},
                {"id": "17", "name": "Egg Biryani", "price": 50, "category": "Lunch", "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80", "available": True},
                {"id": "18", "name": "Chicken Biryani", "price": 80, "category": "Lunch", "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80", "available": True},
                {"id": "19", "name": "Plain Biryani", "price": 40, "category": "Lunch", "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80", "available": True},
                {"id": "20", "name": "Boiled Egg", "price": 10, "category": "Lunch", "image": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80", "available": True},
                {"id": "21", "name": "Omelet", "price": 15, "category": "Lunch", "image": "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=500&q=80", "available": True},

                # Chaat Items
                {"id": "22", "name": "Panipuri (6 Pcs)", "price": 30, "category": "Chaat Items", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "23", "name": "Bhel Puri", "price": 40, "category": "Chaat Items", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "24", "name": "Masala Puri", "price": 40, "category": "Chaat Items", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "25", "name": "Sev Puri", "price": 40, "category": "Chaat Items", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "26", "name": "Aloo Puri", "price": 40, "category": "Chaat Items", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "27", "name": "Dahi Puri", "price": 40, "category": "Chaat Items", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},

                # Snacks 4.00 PM
                {"id": "28", "name": "Vadai", "price": 5, "category": "Snacks", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80", "available": True},
                {"id": "29", "name": "Parrupu Vadai", "price": 5, "category": "Snacks", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80", "available": True},
                {"id": "30", "name": "Keerai Vadai", "price": 10, "category": "Snacks", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80", "available": True},
                {"id": "31", "name": "Onion Pakoda", "price": 20, "category": "Snacks", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "32", "name": "Sundal", "price": 15, "category": "Snacks", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},
                {"id": "33", "name": "Verkadalai", "price": 15, "category": "Snacks", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", "available": True},

                # Fresh Juices
                {"id": "34", "name": "Water Melon", "price": 20, "category": "Fresh Juices", "image": "https://images.unsplash.com/photo-1587883012610-e3df17d41270?w=500&q=80", "available": True},
                {"id": "35", "name": "Lemon Mint", "price": 20, "category": "Fresh Juices", "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80", "available": True},
                {"id": "36", "name": "Ginger Lemon", "price": 20, "category": "Fresh Juices", "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80", "available": True},

                # Soup Items
                {"id": "37", "name": "Veg Soup", "price": 20, "category": "Soup Items", "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80", "available": True},
                {"id": "38", "name": "Mushroom Soup", "price": 20, "category": "Soup Items", "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80", "available": True},
                {"id": "39", "name": "Chicken Soup", "price": 20, "category": "Soup Items", "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80", "available": True},

                # Night
                {"id": "40", "name": "Chapati with Veg Kuruma", "price": 10, "category": "Night", "image": "https://images.unsplash.com/photo-1565557612627-fa85cf2153fa?w=500&q=80", "available": True},
                {"id": "41", "name": "Parotta with Chicken Kuruma", "price": 10, "category": "Night", "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80", "available": True},
                {"id": "42", "name": "Parotta with Veg Kuruma", "price": 10, "category": "Night", "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80", "available": True},
                {"id": "43", "name": "Chapati with Chicken Kuruma", "price": 10, "category": "Night", "image": "https://images.unsplash.com/photo-1565557612627-fa85cf2153fa?w=500&q=80", "available": True},
                {"id": "44", "name": "Veg Fried Rice", "price": 60, "category": "Night", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80", "available": True},
                {"id": "45", "name": "Veg Noodles", "price": 60, "category": "Night", "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80", "available": True},
                {"id": "46", "name": "Egg Fried Rice", "price": 70, "category": "Night", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80", "available": True},
                {"id": "47", "name": "Egg Noodles", "price": 70, "category": "Night", "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80", "available": True},
                {"id": "48", "name": "Chicken Fried Rice", "price": 80, "category": "Night", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80", "available": True},
                {"id": "49", "name": "Chicken Noodles", "price": 80, "category": "Night", "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80", "available": True},
                {"id": "50", "name": "Chicken 65", "price": 50, "category": "Night", "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&q=80", "available": True},
                {"id": "51", "name": "Chettinad Chicken", "price": 50, "category": "Night", "image": "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=500&q=80", "available": True},
                {"id": "52", "name": "Egg Masala", "price": 20, "category": "Night", "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80", "available": True},
                {"id": "53", "name": "Gobi Masala", "price": 40, "category": "Night", "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", "available": True},
                {"id": "54", "name": "Mushroom Masala", "price": 40, "category": "Night", "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", "available": True},
                {"id": "55", "name": "Kal Dosai - Sambar & Chutney", "price": 10, "category": "Night", "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80", "available": True},
                {"id": "56", "name": "Plain Dosai", "price": 20, "category": "Night", "image": "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80", "available": True},
                {"id": "57", "name": "Egg Dosai", "price": 30, "category": "Night", "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80", "available": True},
                {"id": "58", "name": "Onion Dosai", "price": 30, "category": "Night", "image": "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80", "available": True},
                {"id": "59", "name": "Podi Dosai", "price": 25, "category": "Night", "image": "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80", "available": True},

                # Fried Chicken / Starters
                {"id": "60", "name": "Chicken Wings (2 Pcs)", "price": 60, "category": "Starters", "image": "https://images.unsplash.com/photo-1569058242253-1df34b084afa?w=500&q=80", "available": True},
                {"id": "61", "name": "Chicken Lolipop (2 Pcs)", "price": 60, "category": "Starters", "image": "https://images.unsplash.com/photo-1569058242253-1df34b084afa?w=500&q=80", "available": True},
                {"id": "62", "name": "Chicken Boneless (5 Pcs)", "price": 70, "category": "Starters", "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&q=80", "available": True},
                {"id": "63", "name": "French Fries", "price": 40, "category": "Starters", "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80", "available": True},
                {"id": "64", "name": "Gopi 65", "price": 40, "category": "Starters", "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", "available": True},
            ],
            "orders": [],
            "status": "Medium Rush" # Low Rush, Medium Rush, High Rush
        }
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

db = load_db()

# ── Normalize order for frontend (id, token, total, placedAt) ──
def normalize_order(o):
    return {
        **o,
        'id': o.get('id', o.get('order_id', '')),
        'token': str(o.get('token', o.get('token_number', ''))),
        'total': o.get('total', o.get('total_price', 0)),
        'placedAt': o.get('placedAt', int(o.get('timestamp', 0) * 1000)),
        'order_id': o.get('order_id', o.get('id', '')),
        'token_number': o.get('token_number', o.get('token', 0)),
        'total_price': o.get('total_price', o.get('total', 0)),
    }

# ── Auth ──
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '').strip().lower()
    password = data.get('password', '').strip()
    users = {
        'student': {'password': 'student123', 'role': 'student'},
        'admin':   {'password': 'admin123',   'role': 'admin'},
    }
    user = users.get(username)
    if not user or user['password'] != password:
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({'user': {'username': username, 'role': user['role']}})

@app.route('/api/razorpay-key', methods=['GET'])
def razorpay_key():
    return jsonify({'key': RZP_KEY_ID})

@app.route('/api/create-payment', methods=['POST'])
def create_payment():
    data = request.json
    amount_paise = int(data.get('amount', 0)) * 100
    try:
        rzp_order = rzp_client.order.create({
            'amount': amount_paise, 'currency': 'INR',
            'receipt': 'receipt_' + str(int(time.time()))
        })
        return jsonify({'id': rzp_order['id'], 'amount': amount_paise})
    except Exception:
        return jsonify({'id': 'order_test_' + str(int(time.time())), 'amount': amount_paise, 'test_mode': True})

@app.route('/api/menu', methods=['GET'])
def get_menu():
    return jsonify(db['menu'])

@app.route('/api/menu', methods=['POST'])
def add_menu_item():
    item = request.json
    item['id'] = str(int(time.time()))
    item['available'] = True
    db['menu'].append(item)
    save_db(db)
    socketio.emit('menu_updated', db['menu'])
    return jsonify({'item': item})

@app.route('/api/menu/<item_id>', methods=['DELETE'])
def remove_menu_item(item_id):
    db['menu'] = [i for i in db['menu'] if i['id'] != item_id]
    save_db(db)
    socketio.emit('menu_updated', db['menu'])
    return jsonify({"message": "Deleted"})

@app.route('/api/orders', methods=['POST'])
def place_order():
    order_data = request.json
    order_id = "ORD" + str(int(time.time()))[-6:]
    token_number = len([o for o in db['orders'] if o['status'] != 'Completed']) + 1
    now_ms = int(time.time() * 1000)

    order = {
        "id": order_id,
        "order_id": order_id,
        "token": str(token_number),
        "token_number": token_number,
        "items": order_data.get('items', []),
        "total": order_data.get('total', order_data.get('total_price', 0)),
        "total_price": order_data.get('total', order_data.get('total_price', 0)),
        "subtotal": order_data.get('subtotal', 0),
        "gst": order_data.get('gst', 0),
        "discount": order_data.get('discount', 0),
        "promo": order_data.get('promo'),
        "payment_method": order_data.get('payment_method', 'counter'),
        "pickup_slot": order_data.get('pickup_slot', 'ASAP'),
        "pickup_time": order_data.get('pickup_slot', 'ASAP'),
        "user": order_data.get('user', 'student'),
        "status": "Pending",
        "placedAt": now_ms,
        "timestamp": time.time(),
        "created_at": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }
    db['orders'].append(order)
    pending_count = len([o for o in db['orders'] if o['status'] in ['Pending', 'Preparing']])
    db['status'] = 'High Rush' if pending_count > 10 else ('Medium Rush' if pending_count > 4 else 'Low Rush')
    save_db(db)
    # Broadcast to admin instantly
    socketio.emit('order_placed', order)
    socketio.emit('queue_updated', {
        'current_token': db.get('status', 'Low Rush'),
        'rush_meter': db.get('status', 'Low Rush'),
        'waiting_orders': pending_count
    })
    return jsonify({'order': order})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    normalized = [normalize_order(o) for o in db['orders']]
    return jsonify(sorted(normalized, key=lambda x: x.get('timestamp', 0), reverse=True))

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    new_status = request.json.get('status')
    updated_order = None
    for o in db['orders']:
        if o.get('id') == order_id or o.get('order_id') == order_id:
            o['status'] = new_status
            updated_order = o
            break
    pending_count = len([o for o in db['orders'] if o['status'] in ['Pending', 'Preparing']])
    db['status'] = 'High Rush' if pending_count > 10 else ('Medium Rush' if pending_count > 4 else 'Low Rush')
    save_db(db)
    if updated_order:
        n = normalize_order(updated_order)
        socketio.emit('order_status_changed', {'orderId': order_id, 'order_id': order_id, 'status': new_status, 'order': n, 'timestamp': int(time.time()*1000)})
        socketio.emit('queue_updated', {'rush_meter': db.get('status','Low Rush'), 'waiting_orders': pending_count})
    return jsonify({'message': 'Status updated', 'order': normalize_order(updated_order) if updated_order else None})

@app.route('/api/queue', methods=['GET'])
def get_queue():
    ready_orders = [o for o in db['orders'] if o['status'] == 'Ready']
    preparing_orders = [o for o in db['orders'] if o['status'] == 'Preparing']
    pending_orders = [o for o in db['orders'] if o['status'] == 'Pending']
    
    current_token = ready_orders[0]['token_number'] if ready_orders else (preparing_orders[0]['token_number'] if preparing_orders else "-")
    
    return jsonify({
        "current_token": current_token,
        "waiting_orders": len(preparing_orders) + len(pending_orders),
        "rush_meter": db.get('status', 'Low Rush')
    })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    # Basic Analytics
    item_counts = {}
    revenue = 0
    for o in db['orders']:
        revenue += o.get('total_price', o.get('total', 0))
        for item in o.get('items', []):
            qty = item.get('qty', item.get('quantity', 1))
            item_counts[item['name']] = item_counts.get(item['name'], 0) + qty
            
    top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return jsonify({
        "revenue": revenue,
        "top_items": [{"name": k, "count": v} for k, v in top_items],
        "total_orders": len(db['orders'])
    })

@app.route('/api/ai/recommend', methods=['POST'])
def recommend_items():
    cart_items = request.json.get('cart', [])
    if not cart_items:
        return jsonify([db['menu'][0], db['menu'][1]])
    cart_names = [i['name'] for i in cart_items]
    recommendations = [m for m in db['menu'] if m['name'] not in cart_names]
    return jsonify(random.sample(recommendations, min(2, len(recommendations))))

# ── Cancel order ──
@app.route('/api/orders/<order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    for o in db['orders']:
        if o.get('id') == order_id or o.get('order_id') == order_id:
            if o['status'] != 'Pending':
                return jsonify({'error': f'Cannot cancel — order is {o["status"]}'}), 400
            o['status'] = 'Cancelled'
            save_db(db)
            socketio.emit('order_status_changed', {'orderId': order_id, 'status': 'Cancelled', 'timestamp': int(time.time()*1000)})
            return jsonify({'message': 'Cancelled', 'order': normalize_order(o)})
    return jsonify({'error': 'Order not found'}), 404

# ── Menu availability ──
@app.route('/api/menu/<item_id>/availability', methods=['PUT'])
def set_availability(item_id):
    available = request.json.get('available', True)
    for item in db['menu']:
        if item['id'] == item_id:
            item['available'] = available
            save_db(db)
            socketio.emit('menu_updated', {'id': item_id, 'available': available, 'name': item['name']})
            return jsonify(item)
    return jsonify({'error': 'Item not found'}), 404

# ── Single order lookup (student polling) ──
@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    order = next((o for o in db['orders'] if o.get('id') == order_id or o.get('order_id') == order_id), None)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(normalize_order(order))

@app.route('/api/orders/<order_id>/verify', methods=['POST'])
def verify_order(order_id):
    for o in db['orders']:
        if o['order_id'] == order_id:
            if o['status'] != 'Ready':
                return jsonify({'error': f"Order is {o['status']}, not Ready"}), 400
            o['status'] = 'Completed'
            pending_count = len([x for x in db['orders'] if x['status'] in ['Pending','Preparing']])
            db['status'] = 'High Rush' if pending_count > 10 else ('Medium Rush' if pending_count > 4 else 'Low Rush')
            save_db(db)
            socketio.emit('order_status_changed', {'order_id': order_id, 'status': 'Completed', 'order': o})
            return jsonify({'message': 'Verified & completed', 'order': o})
    return jsonify({'error': 'Order not found'}), 404

# ── Clear completed orders ──
@app.route('/api/admin/clear-completed', methods=['DELETE'])
def clear_completed():
    removed = len([o for o in db['orders'] if o['status'] == 'Completed'])
    db['orders'] = [o for o in db['orders'] if o['status'] != 'Completed']
    save_db(db)
    return jsonify({"message": f"Cleared {removed} completed orders"})

# ── Reset ALL orders ──
@app.route('/api/admin/reset-orders', methods=['DELETE'])
def reset_orders():
    db['orders'] = []
    db['status'] = 'Low Rush'
    save_db(db)
    return jsonify({"message": "All orders cleared"})

@app.route('/api/menu/<item_id>/toggle', methods=['PUT'])
def toggle_availability(item_id):
    for item in db['menu']:
        if item['id'] == item_id:
            item['available'] = not item.get('available', True)
            save_db(db)
            socketio.emit('menu_updated', db['menu'])  # Students see sold-out instantly
            return jsonify(item)
    return jsonify({'error': 'Item not found'}), 404

# ── DB Stats ──
@app.route('/api/admin/db-stats', methods=['GET'])
def db_stats():
    return jsonify({
        "total_menu_items": len(db['menu']),
        "total_orders":     len(db['orders']),
        "pending":          len([o for o in db['orders'] if o['status'] == 'Pending']),
        "preparing":        len([o for o in db['orders'] if o['status'] == 'Preparing']),
        "ready":            len([o for o in db['orders'] if o['status'] == 'Ready']),
        "completed":        len([o for o in db['orders'] if o['status'] == 'Completed']),
        "total_revenue":    sum(o['total_price'] for o in db['orders']),
        "rush_status":      db.get('status', 'Low Rush')
    })

# ── Daily Report Data ──
@app.route('/api/admin/report', methods=['GET'])
def daily_report():
    import datetime
    orders = db['orders']
    total  = len(orders)
    revenue = sum(o.get('total_price', o.get('total', 0)) for o in orders)
    completed = [o for o in orders if o.get('status') == 'Completed']
    pending   = [o for o in orders if o.get('status') in ['Pending','Preparing','Ready']]

    item_counts = {}
    for o in orders:
        for item in o.get('items', []):
            qty = item.get('qty', item.get('quantity', 1))
            item_counts[item['name']] = item_counts.get(item['name'], 0) + qty
    top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return jsonify({
        "date":           datetime.datetime.now().strftime("%d %B %Y"),
        "generated_at":   datetime.datetime.now().strftime("%I:%M %p"),
        "total_orders":   total,
        "completed":      len(completed),
        "active":         len(pending),
        "total_revenue":  revenue,
        "avg_order":      round(revenue / total, 2) if total else 0,
        "top_items":      [{"name": k, "qty": v} for k, v in top_items],
        "orders":         sorted(orders, key=lambda x: int(x.get('token_number', x.get('token', 0) or 0)))
    })

# ═══════════════════════════════════
# RAZORPAY PAYMENT
# ═══════════════════════════════════
@app.route('/api/payment/create-order', methods=['POST'])
def create_payment_order():
    data = request.json
    amount_paise = int(data.get('amount', 0)) * 100  # Convert ₹ to paise
    try:
        rzp_order = rzp_client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': data.get('order_id', 'receipt_' + str(int(time.time()))),
            'notes': {'canteen': 'SmartCanteen JJ College'}
        })
        return jsonify({'razorpay_order_id': rzp_order['id'], 'amount': amount_paise, 'key': RZP_KEY_ID})
    except Exception as e:
        # Fallback: if Razorpay keys not set, return mock for testing
        return jsonify({'razorpay_order_id': 'order_test_' + str(int(time.time())), 'amount': amount_paise, 'key': RZP_KEY_ID, 'test_mode': True})

@app.route('/api/payment/verify', methods=['POST'])
def verify_payment():
    data = request.json
    try:
        body = data['razorpay_order_id'] + '|' + data['razorpay_payment_id']
        expected = hmac.new(RZP_KEY_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
        if expected == data['razorpay_signature']:
            return jsonify({'verified': True})
        return jsonify({'verified': False, 'error': 'Signature mismatch'}), 400
    except Exception:
        # Test mode — always verify
        return jsonify({'verified': True, 'test_mode': True})

# ═══════════════════════════════════
# SOCKET EVENTS
# ═══════════════════════════════════
@socketio.on('connect')
def on_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def on_disconnect():
    print(f'Client disconnected: {request.sid}')

if __name__ == '__main__':
    socketio.run(app, debug=False, port=5000, host='0.0.0.0')
