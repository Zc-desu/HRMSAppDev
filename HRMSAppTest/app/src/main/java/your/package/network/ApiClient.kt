class ApiClient(private val context: Context) {
    private val asyncStorage: AsyncStorage = AsyncStorage(context)
    
    suspend fun createRetrofitInstance(): Retrofit {
        val baseUrl = asyncStorage.getString("API_BASE_URL") 
            ?: throw IllegalStateException("Base URL not found in storage")
            
        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            // other interceptors and configurations
            .build()
            
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        // Only enable BODY level logging in debug builds
        level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
    }
} 