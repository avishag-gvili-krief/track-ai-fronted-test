FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

COPY dist/ /usr/share/nginx/html

EXPOSE 5174

CMD ["nginx", "-g", "daemon off;"]
