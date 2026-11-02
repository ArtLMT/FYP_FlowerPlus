import { useState, type FormEvent } from "react";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { lookupAddress, type AdminAddress } from "@/lib/services/addresses";

/** Admin: find one saved customer address by its id. */
export function useAddressLookup() {
  const [addressId, setAddressId] = useState("");
  const [address, setAddress] = useState<AdminAddress | null>(null);
  const { busy: loading, error, run } = useAsyncAction();

  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addressId.trim()) return;
    setAddress(null);
    return run(async () => setAddress(await lookupAddress(addressId)));
  }

  return {
    addressId,
    setAddressId,
    address,
    loading,
    error,
    canLookup: !loading && Boolean(addressId.trim()),
    lookup,
  };
}
