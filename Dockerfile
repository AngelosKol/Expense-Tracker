# Stage 1: 
FROM node:20.11.1 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install 
COPY . .
RUN npm run build -- --output-path=dist --configuration=production --verbose
# Stage 2: 
FROM nginx:stable-alpine
# Copy the Angular app's build output to Nginx's default serving directory
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]