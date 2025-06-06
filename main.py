from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, auth

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "your-secret-key-123"  # Change for production
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

def get_research_papers(query):
    try:
        query = query.replace(' ', '+')
        url = f"https://scholar.google.com/scholar?q={query}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        papers = []
        for item in soup.select('.gs_ri'):
            title = item.select_one('.gs_rt').text if item.select_one('.gs_rt') else "No title"
            link = item.select_one('.gs_rt a')['href'] if item.select_one('.gs_rt a') else "#"
            abstract = item.select_one('.gs_rs').text if item.select_one('.gs_rs') else "No abstract"
            authors = item.select_one('.gs_a').text if item.select_one('.gs_a') else "Unknown"
            
            papers.append({
                'title': title,
                'link': link,
                'abstract': abstract,
                'authors': authors
            })
        
        return papers
    except Exception as e:
        print(f"Error: {e}")
        return []

@app.route('/')
def index():
    return redirect('/login')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/verify_token', methods=['POST'])
def verify_token():
    try:
        data = request.get_json()
        id_token = data.get('token')
        
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token['email']
        
        session['user'] = email
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/verify_session', methods=['GET'])
def verify_session():
    if 'user' in session:
        return jsonify({'authenticated': True}), 200
    return jsonify({'authenticated': False}), 401

@app.route('/logout')
def logout():
    session.pop('user', None)
    return jsonify({'status': 'success'}), 200

@app.route('/rsp')
def rsp():
    if 'user' not in session:
        return redirect('/login')
    return render_template('rsp.html')

@app.route('/search', methods=['POST'])
def search():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({'results': []})
    
    results = get_research_papers(query)
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)