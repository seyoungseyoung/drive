[program:driveai]
command=/path/to/conda/envs/drive/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app
directory=/path/to/your/app
autostart=true
autorestart=true
stderr_logfile=/var/log/driveai/error.log
stdout_logfile=/var/log/driveai/access.log