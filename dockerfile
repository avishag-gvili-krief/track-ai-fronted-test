FROM node:20-alpine as build

WORKDIR /app

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_BLAZOR_MAPBOX_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BLAZOR_MAPBOX_URL=$VITE_BLAZOR_MAPBOX_URL

RUN npm install && npm run build

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5174

CMD ["nginx", "-g", "daemon off;"]
