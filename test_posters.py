import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        r = await client.post(
            'http://127.0.0.1:8000/recommend',
            json={'title': 'Avatar'},
            timeout=60.0
        )
        data = r.json()
        print(f'Status: {r.status_code}')
        for m in data:
            has_poster = bool(m.get('poster_url'))
            url = m.get('poster_url', '')[:80]
            print(f"  {m['title']}: poster={'YES' if has_poster else 'NO'} | {url}")

asyncio.run(test())
