import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 Test API route called');
  return NextResponse.json({ message: 'Test API is working!' });
}

export async function POST() {
  console.log('🧪 Test API POST route called');
  return NextResponse.json({ message: 'Test API POST is working!' });
}
