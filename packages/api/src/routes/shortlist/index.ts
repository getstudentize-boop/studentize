import {
  addUniversityToShortlist,
  AddToShortlistInputSchema,
} from "./add";
import {
  removeUniversityFromShortlist,
  RemoveFromShortlistInputSchema,
} from "./remove";
import { updateShortlist, UpdateShortlistInputSchema } from "./update";
import { getMyShortlist, GetMyShortlistInputSchema } from "./get-my-shortlist";
import {
  checkIfShortlisted,
  CheckIfShortlistedInputSchema,
} from "./check-if-shortlisted";

import { privateRoute } from "../../utils/middleware";

const addToShortlistHandler = privateRoute
  .input(AddToShortlistInputSchema)
  .handler(async ({ context, input }) => {
    const result = await addUniversityToShortlist(context, input);
    return result;
  });

const removeFromShortlistHandler = privateRoute
  .input(RemoveFromShortlistInputSchema)
  .handler(async ({ context, input }) => {
    const result = await removeUniversityFromShortlist(context, input);
    return result;
  });

const updateShortlistHandler = privateRoute
  .input(UpdateShortlistInputSchema)
  .handler(async ({ context, input }) => {
    const result = await updateShortlist(context, input);
    return result;
  });

const getMyShortlistHandler = privateRoute
  .input(GetMyShortlistInputSchema)
  .handler(async ({ context, input }) => {
    const result = await getMyShortlist(context, input);
    return result;
  });

const checkIfShortlistedHandler = privateRoute
  .input(CheckIfShortlistedInputSchema)
  .handler(async ({ context, input }) => {
    const result = await checkIfShortlisted(context, input);
    return result;
  });

export const shortlist = {
  add: addToShortlistHandler,
  remove: removeFromShortlistHandler,
  update: updateShortlistHandler,
  getMyShortlist: getMyShortlistHandler,
  checkIfShortlisted: checkIfShortlistedHandler,
};
