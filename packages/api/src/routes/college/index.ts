import { privateRoute } from "../../utils/middleware";
import {
  searchUSCollegesHandler,
  SearchUSCollegesInputSchema,
} from "./search-us";
import {
  searchUKCollegesHandler,
  SearchUKCollegesInputSchema,
} from "./search-uk";
import { getUSCollegeHandler, GetUSCollegeInputSchema } from "./get-us-college";
import { getUKCollegeHandler, GetUKCollegeInputSchema } from "./get-uk-college";
import {
  getFilterOptionsHandler,
  GetFilterOptionsInputSchema,
} from "./get-filter-options";
import { collegeListHandler, CollegeListInputSchema } from "./list";
import { collegeGetHandler, CollegeGetInputSchema } from "./get";
import {
  searchScorecardHandler,
  SearchScorecardInputSchema,
} from "./search-scorecard";

const searchUSHandler = privateRoute
  .input(SearchUSCollegesInputSchema)
  .handler(async ({ input }) => {
    return await searchUSCollegesHandler(input);
  });

const searchUKHandler = privateRoute
  .input(SearchUKCollegesInputSchema)
  .handler(async ({ input }) => {
    return await searchUKCollegesHandler(input);
  });

const getUSHandler = privateRoute
  .input(GetUSCollegeInputSchema)
  .handler(async ({ input }) => {
    return await getUSCollegeHandler(input);
  });

const getUKHandler = privateRoute
  .input(GetUKCollegeInputSchema)
  .handler(async ({ input }) => {
    return await getUKCollegeHandler(input);
  });

const getFilterOptionsRouteHandler = privateRoute
  .input(GetFilterOptionsInputSchema)
  .handler(async () => {
    return await getFilterOptionsHandler();
  });

const listHandler = privateRoute
  .input(CollegeListInputSchema)
  .handler(async ({ input }) => {
    return await collegeListHandler(input);
  });

const getHandler = privateRoute
  .input(CollegeGetInputSchema)
  .handler(async ({ input }) => {
    return await collegeGetHandler(input);
  });

const searchScorecardRouteHandler = privateRoute
  .input(SearchScorecardInputSchema)
  .handler(async ({ input }) => {
    return await searchScorecardHandler(input);
  });

export const college = {
  searchUS: searchUSHandler,
  searchUK: searchUKHandler,
  getUS: getUSHandler,
  getUK: getUKHandler,
  getFilterOptions: getFilterOptionsRouteHandler,
  list: listHandler,
  get: getHandler,
  searchScorecard: searchScorecardRouteHandler,
};
