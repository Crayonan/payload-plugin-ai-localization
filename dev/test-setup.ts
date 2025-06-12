// Test setup file for Payload AI Localization plugin
// This file is loaded before running integration tests

console.log('Test environment initialized with:')
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- DATABASE_URI:', process.env.DATABASE_URI?.replace(/(:.*@)/, ':***@') || 'Not set')
console.log('- PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? '***' : 'Not set')
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***' : 'Not set') 