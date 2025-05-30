import { AppDataSource } from './src/database/data-source'

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error)
    process.exit(1)
  })
