FROM denoland/deno:1.38.2

USER deno

WORKDIR /app
ADD ./src /app

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env", "--allow-sys", "index.ts"]
