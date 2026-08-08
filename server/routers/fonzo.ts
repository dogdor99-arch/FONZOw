import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getAccessoryByCode,
  getBrandStoryArticles,
  getFounderArticles,
  getGuitarByCode,
  listAccessories,
  listAccessoryTypes,
  listAlbumItems,
  listAlbums,
  listCatalogs,
  listDealerSections,
  listGuitarTypes,
  listGuitars,
  listPriceBands,
} from "../fonzoContent";

export const fonzoRouter = router({
  guitars: router({
    list: publicProcedure.query(() => listGuitars()),
    byCode: publicProcedure
      .input(z.object({ code: z.string().min(1) }))
      .query(({ input }) => getGuitarByCode(input.code)),
    types: publicProcedure.query(() => listGuitarTypes()),
  }),
  accessories: router({
    list: publicProcedure.query(() => listAccessories()),
    byCode: publicProcedure
      .input(z.object({ code: z.string().min(1) }))
      .query(({ input }) => getAccessoryByCode(input.code)),
    types: publicProcedure.query(() => listAccessoryTypes()),
  }),
  content: router({
    founder: publicProcedure.query(() => getFounderArticles()),
    brandStory: publicProcedure.query(() => getBrandStoryArticles()),
    catalogs: publicProcedure.query(() => listCatalogs()),
    dealers: publicProcedure.query(() => listDealerSections()),
    priceBands: publicProcedure.query(() => listPriceBands()),
  }),
  gallery: router({
    albums: publicProcedure.query(() => listAlbums()),
    items: publicProcedure
      .input(z.object({ albumCode: z.string().min(1) }))
      .query(({ input }) => listAlbumItems(input.albumCode)),
  }),
});
