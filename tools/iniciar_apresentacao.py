"""Inicia o TechPaper para ensaio: Docker Compose v2 + Python 3, sem serviços externos."""
import os, sys, subprocess, secrets, time
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError
ROOT = Path(__file__).resolve().parents[1]
CONF = ROOT / '.env.apresentacao'
URL = 'http://127.0.0.1:18080'
def main():
    if not CONF.exists():
        text = 'POSTGRES_PASSWORD='+secrets.token_hex(24)+'\nBOOTSTRAP_LOGIN=apresentacao@example.test\nBOOTSTRAP_PASSWORD='+secrets.token_hex(14)+'\n'
        with os.fdopen(os.open(CONF, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as f:
            f.write(text)
    conf = dict(line.split('=', 1) for line in CONF.read_text().splitlines() if '=' in line)
    env = dict(os.environ)
    # Set the project and all database settings explicitly to keep other checkouts separate.
    env.update(conf, POSTGRES_DB='techpaper_demo',POSTGRES_USER='techpaper_demo',TECHPAPER_HTTP_BIND='127.0.0.1:18080')
    args = ['docker','compose','--env-file',str(CONF),'-p','techpaper-apresentacao','-f',str(ROOT/'compose.yaml')]
    subprocess.run(args+['up','-d','--build'],cwd=ROOT,env=env,check=True)
    for _ in range(60):
        try:
            with urlopen(URL+'/health/ready', timeout=3) as r:
                if r.status==200: break
        except (URLError, OSError): pass
        time.sleep(2)
    else: raise SystemExit('A API não ficou pronta. Consulte os logs do projeto techpaper-apresentacao no Docker Desktop.')
    subprocess.run([sys.executable,str(ROOT/'tools/dados_apresentacao.py'),'--url',URL,'--login',conf['BOOTSTRAP_LOGIN'],'--confirmar-base-demo'],env=dict(env,TP_DEMO_PASSWORD=conf['BOOTSTRAP_PASSWORD']),check=True)
    print('Portal:', URL, '\nLogin:',conf['BOOTSTRAP_LOGIN'],'\nSenha: valor de BOOTSTRAP_PASSWORD no arquivo .env.apresentacao desta pasta. Não compartilhe esse arquivo.')
if __name__=='__main__':
    try: main()
    except FileNotFoundError: sys.exit('Não encontrei o Docker. Abra o Docker Desktop com Compose v2 e tente novamente.')
    except subprocess.CalledProcessError as e: sys.exit(e.returncode)
