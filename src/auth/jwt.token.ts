export function tokenify(jwtService, _id: string, email:string){
    const payload = { _id, email };
      const token = jwtService.sign(payload);
      return token;
}