import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    '''
    Business: Create database connection
    Returns: Database connection object
    '''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API for fetching and managing memes from database
    Args: event - dict with httpMethod, queryStringParameters, body
          context - object with request_id attribute
    Returns: HTTP response with memes data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            search = params.get('search', '').lower()
            category = params.get('category', '')
            user_id = event.get('headers', {}).get('x-user-id', '')
            
            query = '''
                SELECT 
                    m.*,
                    CASE WHEN uf.id IS NOT NULL THEN true ELSE false END as is_favorite
                FROM memes m
                LEFT JOIN user_favorites uf ON m.id = uf.meme_id AND uf.user_id = %s
                WHERE 1=1
            '''
            query_params: List[Any] = [user_id]
            
            if category == 'favorites':
                query += ' AND uf.id IS NOT NULL'
            elif category and category != 'all':
                query += ' AND m.category = %s'
                query_params.append(category)
            
            if search:
                query += ''' AND (
                    LOWER(m.title) LIKE %s OR 
                    LOWER(m.description) LIKE %s OR
                    EXISTS (SELECT 1 FROM unnest(m.tags) tag WHERE LOWER(tag) LIKE %s)
                )'''
                search_pattern = f'%{search}%'
                query_params.extend([search_pattern, search_pattern, search_pattern])
            
            query += ' ORDER BY m.created_at DESC LIMIT 100'
            
            cursor.execute(query, query_params)
            memes = cursor.fetchall()
            
            result = []
            for meme in memes:
                result.append({
                    'id': meme['id'],
                    'title': meme['title'],
                    'description': meme['description'],
                    'mediaUrl': meme['media_url'],
                    'mediaType': meme['media_type'],
                    'category': meme['category'],
                    'tags': meme['tags'] or [],
                    'isFavorite': meme['is_favorite'],
                    'viewsCount': meme['views_count'],
                    'favoritesCount': meme['favorites_count']
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'memes': result}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'toggle_favorite':
                user_id = event.get('headers', {}).get('x-user-id', '')
                meme_id = body_data.get('meme_id')
                
                if not user_id or not meme_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing user_id or meme_id'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    'SELECT id FROM user_favorites WHERE user_id = %s AND meme_id = %s',
                    (user_id, meme_id)
                )
                existing = cursor.fetchone()
                
                if existing:
                    cursor.execute(
                        'UPDATE user_favorites SET created_at = created_at WHERE user_id = %s AND meme_id = %s RETURNING id',
                        (user_id, meme_id)
                    )
                    cursor.execute(
                        'UPDATE memes SET favorites_count = favorites_count - 1 WHERE id = %s',
                        (meme_id,)
                    )
                    is_favorite = False
                else:
                    cursor.execute(
                        'INSERT INTO user_favorites (user_id, meme_id) VALUES (%s, %s)',
                        (user_id, meme_id)
                    )
                    cursor.execute(
                        'UPDATE memes SET favorites_count = favorites_count + 1 WHERE id = %s',
                        (meme_id,)
                    )
                    is_favorite = True
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'isFavorite': is_favorite}),
                    'isBase64Encoded': False
                }
            
            if action == 'add_meme':
                title = body_data.get('title')
                description = body_data.get('description')
                media_url = body_data.get('media_url')
                media_type = body_data.get('media_type', 'image')
                category = body_data.get('category', 'new')
                tags = body_data.get('tags', [])
                source_url = body_data.get('source_url', '')
                
                cursor.execute(
                    '''INSERT INTO memes (title, description, media_url, media_type, category, tags, source_url)
                       VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
                    (title, description, media_url, media_type, category, tags, source_url)
                )
                meme_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'meme_id': meme_id}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
