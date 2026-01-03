import ApplicationForm from '@/components/Apply/ApplicationForm';
import Link from "next/link"

export default function ApplyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Оставить заявку</h1>
        <p className="text-gray-600 mb-8">
          Заполните форму, и мы свяжемся с вами в ближайшее время
        </p>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ApplicationForm />
        </div>
        <h1 className="mt-4">
          <Link href="/admin/articles">Роблокс</Link>
        </h1>
      </div>
    </div>
  );
}