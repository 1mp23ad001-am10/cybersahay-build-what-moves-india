FROM node:22-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv ffmpeg curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY voice_service/requirements.txt ./voice_service/requirements.txt
RUN python3 -m venv /opt/voice-env \
  && /opt/voice-env/bin/pip install --no-cache-dir -r voice_service/requirements.txt

COPY . .
RUN npm run build \
  && chmod +x /app/start-render.sh

ENV PATH="/opt/voice-env/bin:${PATH}"
ENV LOCAL_ASR_URL="http://127.0.0.1:8000/transcribe"
ENV LOCAL_ASR_ENABLED="false"
ENV WHISPER_DEVICE="cpu"
ENV WHISPER_COMPUTE="int8"
ENV WHISPER_MODEL="base"

EXPOSE 10000
CMD ["/app/start-render.sh"]
