echo "Waiting for database..."
./wait-until database:3306 -- mysqladmin ping -u root -h database:3307 -pWell#ON123

echo "Migrating..."
npm run db:push
npm run db:generate

echo "Starting server..."
npm run start:dev