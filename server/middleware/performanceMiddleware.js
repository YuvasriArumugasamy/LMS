/**
 * Performance Monitoring Middleware
 * Tracks response times and logs slow queries
 */

export const responseTimeLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow API requests (over 2 seconds)
    if (duration > 2000) {
      console.warn(`⚠️ [SLOW API] ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Log very slow requests (over 5 seconds) as errors
    if (duration > 5000) {
      console.error(`❌ [CRITICAL SLOW] ${req.method} ${req.path} took ${duration}ms - User: ${req.user?.employeeId || 'guest'}`);
    }
  });
  
  next();
};

/**
 * Database Query Monitoring (Development only)
 * Enable Mongoose debug mode to track query performance
 */
export const enableQueryLogging = (mongoose) => {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_QUERIES === 'true') {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      const queryStr = JSON.stringify(query).substring(0, 200);
      console.log(`[Mongoose Debug] ${collectionName}.${method}(${queryStr}...)`);
    });
    console.log('🔍 [Performance] Mongoose query logging enabled');
  }
};

/**
 * Connection Pool Monitoring
 */
export const monitorDatabaseConnection = (mongoose) => {
  mongoose.connection.on('connected', () => {
    console.log('✅ [MongoDB] Connected successfully');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [MongoDB] Disconnected - reconnecting...');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ [MongoDB] Connection error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [MongoDB] Reconnected successfully');
  });
};
