import { AppDataSource } from './data-source'

async function syncDatabase() {
  try {
    console.log('Connecting to database...')
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    console.log('Synchronizing database schema...')
    await AppDataSource.synchronize()
    console.log('Database schema synchronized successfully')

    await AppDataSource.destroy()
    console.log('Database connection closed')
    process.exit(0)
  } catch (error) {
    console.error('Error during database synchronization:', error)
    process.exit(1)
  }
}

syncDatabase() 