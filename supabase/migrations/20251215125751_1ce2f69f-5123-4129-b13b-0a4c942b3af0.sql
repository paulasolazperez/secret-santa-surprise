-- Enable realtime for group_members table so participants see their assignment automatically
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;