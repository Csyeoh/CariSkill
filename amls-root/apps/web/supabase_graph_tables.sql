-- 1. Create the roadmap_nodes table
CREATE TABLE public.roadmap_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    title TEXT NOT NULL,
    rationale TEXT,
    depth_level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by roadmap_id
CREATE INDEX idx_roadmap_nodes_roadmap_id ON public.roadmap_nodes(roadmap_id);

-- 2. Create the roadmap_edges table
CREATE TABLE public.roadmap_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    source_node_id TEXT NOT NULL, -- The prerequisite
    target_node_id TEXT NOT NULL, -- The node being unlocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup of a roadmap's edges
CREATE INDEX idx_roadmap_edges_roadmap_id ON public.roadmap_edges(roadmap_id);

-- 3. Set up Row Level Security (RLS)
ALTER TABLE public.roadmap_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_edges ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own nodes (via the parent roadmaps table)
CREATE POLICY "Users can view their own roadmap nodes"
    ON public.roadmap_nodes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps
            WHERE roadmaps.id = roadmap_nodes.roadmap_id
            AND roadmaps.user_id = auth.uid()
        )
    );

-- Allow users to insert their own nodes
CREATE POLICY "Users can insert their own roadmap nodes"
    ON public.roadmap_nodes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roadmaps
            WHERE roadmaps.id = roadmap_nodes.roadmap_id
            AND roadmaps.user_id = auth.uid()
        )
    );

-- Allow users to read their own edges
CREATE POLICY "Users can view their own roadmap edges"
    ON public.roadmap_edges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps
            WHERE roadmaps.id = roadmap_edges.roadmap_id
            AND roadmaps.user_id = auth.uid()
        )
    );

-- Allow users to insert their own edges
CREATE POLICY "Users can insert their own roadmap edges"
    ON public.roadmap_edges FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roadmaps
            WHERE roadmaps.id = roadmap_edges.roadmap_id
            AND roadmaps.user_id = auth.uid()
        )
    );
