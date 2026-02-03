// Minimal Toast Hook
export const useToast = () => ({
    toast: (props: any) => alert(`${props.title}: ${props.description}`)
});
