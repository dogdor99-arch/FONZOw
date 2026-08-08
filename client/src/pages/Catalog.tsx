import { Download, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";

export default function Catalog() {
  const { t } = useLocale();
  const { data: catalogs = [], isLoading } = trpc.fonzo.content.catalogs.useQuery();

  return (
    <>
      <PageHeading
        eyebrow={t("เอกสารสินค้า", "Product documents")}
        title="Catalog"
        description={t(
          "โบรชัวร์และแคตตาล็อกอย่างเป็นทางการของ Fonzo รวมสเปควัสดุ โครงสร้าง และรายละเอียดแต่ละซีรีส์",
          "Official Fonzo brochures and catalogues, covering materials, bracing and series-level detail.",
        )}
        crumbs={[{ label: "Catalog" }]}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse bg-secondary" />
            ))}
          </div>
        ) : catalogs.length === 0 ? (
          <p className="text-muted-foreground">
            {t("ยังไม่มีเอกสารเผยแพร่ในขณะนี้", "No documents are published right now.")}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalogs.map((item, index) => (
              <Reveal key={item.code} delay={index * 60}>
                <article className="flex h-full flex-col border border-border bg-card p-7">
                  <FileText className="h-6 w-6 text-gold" strokeWidth={1.4} />
                  <h2 className="mt-5 font-display text-2xl leading-snug">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(
                      "ไฟล์ PDF ฉบับเต็ม เปิดอ่านหรือดาวน์โหลดเพื่อเก็บไว้ศึกษาแบบละเอียด",
                      "Full PDF — open it in the browser or download it for detailed study.",
                    )}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-8">
                    {item.fileUrl && (
                      <>
                        <Button
                          asChild
                          className="press h-11 rounded-none bg-brand px-5 text-[11px] tracking-[0.18em] text-brand-foreground uppercase hover:bg-brand/90">
                          <a href={item.fileUrl} target="_blank" rel="noreferrer">
                            {t("เปิดอ่าน", "Open")}
                          </a>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="press h-11 rounded-none border-foreground/25 px-5 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand">
                          <a href={item.fileUrl} download>
                            <Download className="mr-2 h-3.5 w-3.5" />
                            {t("ดาวน์โหลด", "Download")}
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

