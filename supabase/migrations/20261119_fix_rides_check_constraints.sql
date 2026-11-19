-- Corrige los CHECK constraints de rides que rechazaban valores válidos del formulario.
-- Ejecutar en el SQL Editor de Supabase (proyecto BikeMates).

-- 1) bike_type: el formulario ofrece "all" (Todas) como valor por defecto y no es obligatorio.
ALTER TABLE public.rides DROP CONSTRAINT IF EXISTS rides_bike_type_check;
ALTER TABLE public.rides
  ADD CONSTRAINT rides_bike_type_check
  CHECK (bike_type IN ('all', 'road', 'mtb', 'gravel', 'urban', 'other'));

-- 2) meeting_point: la app permite fijar el punto solo en el mapa, solo con detalles
--    escritos, o ambos. No debe exigirse texto en meeting_point si hay detalles o coordenadas.
ALTER TABLE public.rides DROP CONSTRAINT IF EXISTS rides_meeting_point_check;
ALTER TABLE public.rides
  ADD CONSTRAINT rides_meeting_point_check
  CHECK (
    btrim(coalesce(meeting_point, '')) <> ''
    OR btrim(coalesce(meeting_point_details, '')) <> ''
    OR (latitude IS NOT NULL AND longitude IS NOT NULL)
  );

-- 3) description: no es obligatoria; se acepta cadena vacía.
ALTER TABLE public.rides DROP CONSTRAINT IF EXISTS rides_description_check;
ALTER TABLE public.rides
  ADD CONSTRAINT rides_description_check
  CHECK (description IS NOT NULL AND length(description) <= 8000);
