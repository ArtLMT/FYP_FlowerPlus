/** Facts about the shop that more than one screen shows. */

/** Where customers write to the shop. It is also the address the shop's emails are sent from. */
export const SHOP_EMAIL = "flowerplusfyp@gmail.com";

/**
 * Where the shop delivers. The system does not check it: a saved address is one line of free text,
 * so staff cancel an order outside the area, with a reason.
 */
export const DELIVERY_AREA = "nội thành TP. Hồ Chí Minh";

/** Start of the first delivery slot to the end of the last one (DELIVERY_SLOTS in services/orders.ts). */
export const DELIVERY_HOURS = "9:00 – 21:00";
