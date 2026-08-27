function StockPanel() {
  const { t } = useLocale();
  const { data: catalogGuitars = [], isLoading: catalogLoading } = trpc.fonzo.guitars.list.useQuery();
  
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]); // สร้าง State ไว้ให้พิมพ์ได้อิสระ
  const [loadingSupa, setLoadingSupa] = useState(true);

  const fetchSupabaseProducts = async () => {
    setLoadingSupa(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (!error) setSupabaseProducts(data || []);
    setLoadingSupa(false);
  };

  useEffect(() => { fetchSupabaseProducts(); }, []);

  // รวมข้อมูลแคตตาล็อกและ Supabase ให้ตาราง
  useEffect(() => {
    const formattedCatalog = catalogGuitars.map((g: any, idx: number) => ({
      id: `catalog-${idx}`,
      name: g.name || g.code,
      price: Number(g.price || 0),
      stock: g.stock ?? 10,
      category: g.series || "Catalog Guitar",
      image_url: g.image || "/fonzo-logo.png",
      isCatalogItem: true,
    }));

    const supaNames = new Set(supabaseProducts.map(p => p.name.toLowerCase().trim()));
    const uniqueCatalog = formattedCatalog.filter(c => !supaNames.has(c.name.toLowerCase().trim()));
    
    setTableData([...supabaseProducts, ...uniqueCatalog]);
  }, [catalogGuitars, supabaseProducts]);

  const handleSaveRow = async (idx: number, product: any) => {
    try {
      // ไม่ว่าจะเป็นของใหม่ หรือของเก่า ให้บันทึกลง Supabase เสมอ
      const { error } = await supabase.from("products").upsert({
        id: product.isCatalogItem ? undefined : product.id, // ถ้าเป็นแคตตาล็อกให้สร้าง id ใหม่
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url
      }, { onConflict: "name" }); // ใช้ชื่อกีตาร์เป็นตัวอ้างอิงเพื่ออัปเดต

      if (error) throw error;
      toast.success(t("บันทึกข้อมูลเรียบร้อย", "Saved successfully"));
      fetchSupabaseProducts(); // โหลดข้อมูลใหม่
    } catch (err: any) {
      toast.error(t("บันทึกไม่สำเร็จ", "Save failed"));
    }
  };

  // ... (โค้ดฟอร์มเพิ่มสินค้า handleAddProduct คงเดิมไว้ได้เลยครับ) ...

  const isLoading = catalogLoading || loadingSupa;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-display flex items-center gap-2">
          <Package className="h-5 w-5 text-brand" /> {t("จัดการสต็อกและข้อมูลสินค้าทั้งหมด", "All Products & Inventory")}
        </h2>
        <Button onClick={fetchSupabaseProducts} variant="outline" size="sm" className="h-9 rounded-none border-border">
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> {t("รีเฟรช", "Refresh")}
        </Button>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">{t("ชื่อสินค้า / รุ่น", "Name")}</th>
              <th className="p-4">{t("หมวดหมู่", "Category")}</th>
              <th className="p-4">{t("ราคา (บาท)", "Price")}</th>
              <th className="p-4">{t("สต็อก", "Stock")}</th>
              <th className="p-4 text-right">{t("จัดการ / บันทึก", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : tableData.map((p, idx) => (
                <tr key={idx} className="hover:bg-secondary/20">
                  <td className="p-4">
                    <Input 
                      value={p.name} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].name = e.target.value;
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent min-w-[200px]" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      value={p.category} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].category = e.target.value;
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-32" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      type="number" 
                      value={p.price} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].price = Number(e.target.value);
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-24" 
                    />
                  </td>
                  <td className="p-4">
                    <Input 
                      type="number" 
                      value={p.stock} 
                      onChange={(e) => {
                        const newData = [...tableData];
                        newData[idx].stock = Number(e.target.value);
                        setTableData(newData);
                      }} 
                      className="h-9 border-border rounded-none bg-transparent w-16 text-center font-bold" 
                    />
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => handleSaveRow(idx, p)} 
                      className="h-8 rounded-none bg-brand text-brand-foreground px-3 text-[10px] uppercase"
                    >
                      บันทึก
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}