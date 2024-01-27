FROM denoland/deno:alpine-1.39.4

WORKDIR /app

COPY /src .

RUN deno cache api/index.ts

EXPOSE 8000

CMD ["run", "--allow-net", "api/index.ts"]



