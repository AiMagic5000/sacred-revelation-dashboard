import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">508</span>
            </div>
            <span className="font-semibold text-xl text-gray-900">Ministry Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Start your free trial</h1>
          <p className="text-gray-600 mt-2">14 days free, no credit card required</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
              footerActionLink: 'text-primary-600 hover:text-primary-700',
            },
          }}
        />
      </div>
    </div>
  )
}
