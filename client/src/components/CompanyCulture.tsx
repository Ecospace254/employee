export default function CompanyCulture() {
  return (
    <div className="bg-primary text-primary-foreground p-8 rounded-lg my-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-sm font-medium text-primary-foreground/80 mb-2">
          LEADERSHIP & COMPANY CULTURE
        </div>

        <blockquote className="text-xl md:text-2xl font-poppins italic leading-relaxed mb-4" data-testid="text-culture-quote">
          "We aspire to be a brand that is authentic, inspiring, and relevant."
        </blockquote>
        
        <p className="text-sm text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto" data-testid="text-culture-description">
          At the heart of service is networking. We aspire through our start "Networking and building your community at work right away. Learn more about our{" "}
          <a href="#" className="underline hover:no-underline" data-testid="link-internship-strategy">
            Internships strategy</a> to help you hit the ground running."
        </p>
      </div>
    </div>
  );
}