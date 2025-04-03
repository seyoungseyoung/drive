# Drive AI Project

## Environment Setup

1. Clone the repository
2. Create and activate conda environment:
   ```bash
   conda create -n drive python=3.11
   conda activate drive
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your actual API keys and credentials

## Important Security Notes
- Never commit the `.env` file to version control
- Keep your API keys and sensitive credentials secure
- The `.env` file is already included in `.gitignore`

[program:driveai]
command=/path/to/conda/envs/drive/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app
directory=/path/to/your/app
autostart=true
autorestart=true
stderr_logfile=/var/log/driveai/error.log
stdout_logfile=/var/log/driveai/access.log