import json
import os
from typing import Dict, Any
import psycopg2

INITIAL_MEMES = [
    {
        'title': 'Distracted Boyfriend',
        'description': 'Man looking at another woman while his girlfriend looks disapproving',
        'media_url': 'https://cdn.poehali.dev/projects/bec87bec-1508-47d4-b95c-e4f127d771cb/files/85aee34e-dc44-4f84-bd26-221b00123fbb.jpg',
        'media_type': 'image',
        'category': 'popular',
        'tags': ['relationship', 'choice', 'distraction'],
        'source_url': 'https://knowyourmeme.com/memes/distracted-boyfriend'
    },
    {
        'title': 'Woman Yelling at Cat',
        'description': 'Angry woman pointing at confused cat at dinner table',
        'media_url': 'https://cdn.poehali.dev/projects/bec87bec-1508-47d4-b95c-e4f127d771cb/files/d33b31a5-bd89-43a3-83ee-6f712c477653.jpg',
        'media_type': 'image',
        'category': 'new',
        'tags': ['argument', 'confusion', 'cat'],
        'source_url': 'https://knowyourmeme.com/memes/woman-yelling-at-a-cat'
    },
    {
        'title': 'Success Kid',
        'description': 'Baby making fist pump gesture on beach',
        'media_url': 'https://cdn.poehali.dev/projects/bec87bec-1508-47d4-b95c-e4f127d771cb/files/83d2d203-0400-4cb7-b449-47b7655bee4e.jpg',
        'media_type': 'image',
        'category': 'old',
        'tags': ['success', 'victory', 'baby'],
        'source_url': 'https://knowyourmeme.com/memes/success-kid'
    },
    {
        'title': 'Drake Hotline Bling',
        'description': 'Drake rejecting something vs approving something else',
        'media_url': 'https://i.imgflip.com/30b1gx.jpg',
        'media_type': 'image',
        'category': 'popular',
        'tags': ['preference', 'choice', 'approval'],
        'source_url': 'https://knowyourmeme.com/memes/drakeposting'
    },
    {
        'title': 'Surprised Pikachu',
        'description': 'Pikachu with shocked expression',
        'media_url': 'https://i.imgflip.com/1bil.jpg',
        'media_type': 'image',
        'category': 'popular',
        'tags': ['shock', 'surprise', 'pokemon'],
        'source_url': 'https://knowyourmeme.com/memes/surprised-pikachu'
    },
    {
        'title': 'This Is Fine',
        'description': 'Dog sitting in room on fire saying everything is fine',
        'media_url': 'https://i.imgflip.com/wxica.jpg',
        'media_type': 'image',
        'category': 'popular',
        'tags': ['chaos', 'denial', 'dog'],
        'source_url': 'https://knowyourmeme.com/memes/this-is-fine'
    },
    {
        'title': 'Expanding Brain',
        'description': 'Brain getting bigger with increasingly complex ideas',
        'media_url': 'https://i.imgflip.com/1jwhww.jpg',
        'media_type': 'image',
        'category': 'new',
        'tags': ['intelligence', 'progression', 'brain'],
        'source_url': 'https://knowyourmeme.com/memes/expanding-brain'
    },
    {
        'title': 'Hide the Pain Harold',
        'description': 'Older man with forced smile hiding internal pain',
        'media_url': 'https://i.imgflip.com/gk5el.jpg',
        'media_type': 'image',
        'category': 'old',
        'tags': ['pain', 'smile', 'hiding'],
        'source_url': 'https://knowyourmeme.com/memes/hide-the-pain-harold'
    },
    {
        'title': 'Roll Safe Think About It',
        'description': 'Man pointing at his head with knowing look',
        'media_url': 'https://i.imgflip.com/1h7in3.jpg',
        'media_type': 'image',
        'category': 'popular',
        'tags': ['smart', 'thinking', 'logic'],
        'source_url': 'https://knowyourmeme.com/memes/roll-safe'
    },
    {
        'title': 'One Does Not Simply',
        'description': 'Boromir saying you cannot simply do something',
        'media_url': 'https://i.imgflip.com/1bij.jpg',
        'media_type': 'image',
        'category': 'old',
        'tags': ['lotr', 'impossible', 'simply'],
        'source_url': 'https://knowyourmeme.com/memes/one-does-not-simply-walk-into-mordor'
    }
]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Seed database with initial popular memes
    Args: event - dict with httpMethod
          context - object with request_id attribute
    Returns: HTTP response with insertion status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        
        inserted_count = 0
        
        for meme in INITIAL_MEMES:
            cursor.execute(
                'SELECT id FROM memes WHERE title = %s',
                (meme['title'],)
            )
            if not cursor.fetchone():
                cursor.execute(
                    '''INSERT INTO memes (title, description, media_url, media_type, category, tags, source_url)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)''',
                    (
                        meme['title'],
                        meme['description'],
                        meme['media_url'],
                        meme['media_type'],
                        meme['category'],
                        meme['tags'],
                        meme['source_url']
                    )
                )
                inserted_count += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'inserted': inserted_count,
                'message': f'Inserted {inserted_count} memes'
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
