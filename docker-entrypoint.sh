echo "Waiting for database..."
./wait-until.sh database:3306 -t 60 -- npm run db:push

echo "Generating database schema..."
npm run db:generate

echo "Starting server..."
npm run start:dev