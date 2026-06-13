import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { products as fallback } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      snap => {
        if (!snap.empty) {
          setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setSeeded(true);
        } else {
          setProducts(fallback);
          setSeeded(false);
        }
        setLoading(false);
      },
      () => { setProducts(fallback); setLoading(false); }
    );
    return unsub;
  }, []);

  return { products, loading, seeded };
}
