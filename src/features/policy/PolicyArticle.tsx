import Link from "next/link";
import Container from "@/components/ui/Container";
import { POLICIES, POLICY_ORDER, POLICY_UPDATED, type Policy } from "@/features/policy/policies";
import { SHOP_EMAIL } from "@/lib/shop";

/** One policy page: the text from `policies.ts`, then links to the other policies. */
export default function PolicyArticle({ policy }: { policy: Policy }) {
  return (
    <main className="bg-neutral-surface pb-section pt-6 md:pt-10">
      <Container>
        <article className="mx-auto max-w-[760px]">
          <h1 className="m-0 font-serif text-heading-lg font-medium leading-[1.2] text-text-primary md:text-[36px]">
            {policy.title}
          </h1>
          <p className="m-0 mt-2 font-sans text-body-sm text-text-muted">Cập nhật ngày {POLICY_UPDATED}</p>
          <p className="m-0 mt-5 font-sans text-body-lg leading-[1.7] text-text-secondary">{policy.intro}</p>

          {policy.sections.map((section) => (
            <section key={section.heading} className="mt-9">
              <h2 className="m-0 font-serif text-heading-md font-medium text-text-primary">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="m-0 mt-3 font-sans text-body-lg leading-[1.7] text-text-secondary">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="m-0 mt-3 list-disc space-y-2 pl-5 font-sans text-body-lg leading-[1.7] text-text-secondary">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}

          <p className="m-0 mt-9 font-sans text-body-lg leading-[1.7] text-text-secondary">
            Liên hệ cửa hàng:{" "}
            <a href={`mailto:${SHOP_EMAIL}`} className="text-primary underline hover:text-primary-hover">{SHOP_EMAIL}</a>
          </p>

          <nav aria-label="Các chính sách khác" className="mt-12 border-t border-neutral-border pt-6">
            <p className="m-0 font-sans text-label font-bold tracking-badge text-text-muted">CÁC CHÍNH SÁCH KHÁC</p>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {POLICY_ORDER.filter((slug) => slug !== policy.slug).map((slug) => (
                <li key={slug}>
                  <Link href={`/policies/${slug}`} className="font-sans text-body-lg text-primary underline hover:text-primary-hover">
                    {POLICIES[slug].title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>
      </Container>
    </main>
  );
}
