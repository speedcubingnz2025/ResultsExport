import mysql from 'mysql2/promise';
import fs from 'fs';

console.log('Creating database connection');
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'wca',
});

const makeRecordsQuery = (type) => `SELECT r.event_id, r.person_name, r.person_id, r.${type} FROM results r
  JOIN (
    SELECT event_id, min(${type}) as ${type} FROM results
    WHERE person_country_id="New Zealand"
    AND ${type} > 0
    GROUP BY event_id
  ) nz_fastest
  ON r.event_id=nz_fastest.event_id AND r.${type}=nz_fastest.${type}
  WHERE r.person_country_id="New Zealand"
  AND r.event_id IN ("333", "222", "444", "555", "666", "777", "333bf", "333fm", "333oh", "333mbf", "clock", "minx", "pyram", "skewb", "sq1", "444bf", "555bf")`;

try {
  console.log('Starting queries');
  const [averages] = await connection.query(makeRecordsQuery('average'));
  const [singles] = await connection.query(makeQuery('best'));
  const data = {averages, singles};
  fs.writeFileSync('./output/national_records.json', JSON.stringify(data, null, 2));
  await connection.end();
  console.log('Finished update')
} catch (error) {
  console.error(error);
}
